# frozen_string_literal: true

# Faceted, fully-static pagination for collection index pages.
#
# No JavaScript is involved anywhere in this — every page, and every
# filter pill, is a real generated HTML file with a plain <a href>.
# That's the point: browsing and filtering both work with JS off.
#
# Any index page opts in via front matter:
#
#   pagination:
#     enabled: true
#     collection: media    # name of the collection (site.media, site.articles, ...)
#     per_page: 12          # optional, default 10
#     sort_field: date      # optional, default "date"
#     sort_reverse: true    # optional, default true
#     facet_field: type     # optional. A front-matter field to generate
#                            # per-value static pages for. Works with a
#                            # scalar field (e.g. `type: podcast`) or an
#                            # array field (e.g. `tags: [foo, bar]`).
#
# The page's own Liquid content is reused as the template for every
# generated page — the unfiltered /page/2/, /page/3/, ... and every
# /<facet-slug>/, /<facet-slug>/page/2/, .... Templates read two things:
#
#   page.pagination_items   — the docs to render on this page
#   page.pager               — nav + facet-link data, see build below
#
# Page 1 of the unfiltered facet reuses the source page itself, so its
# URL doesn't change (e.g. /media/ stays /media/).

module Faceted
  class PaginatedPage < Jekyll::Page
    def initialize(site, dir, source_page)
      @site = site
      @base = site.source
      @dir  = dir
      @name = "index.html"

      process(@name)
      self.data = source_page.data.dup
      self.content = source_page.content
      # This copy is a generated result page, not itself a pagination
      # source — make sure the generator never tries to re-paginate it.
      data["pagination"] = nil
    end
  end

  class Generator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      site.pages
          .select { |p| p.data["pagination"].is_a?(Hash) && p.data["pagination"]["enabled"] }
          .each { |page| paginate(site, page) }
    end

    private

    def paginate(site, source_page)
      config          = source_page.data["pagination"]
      collection_name = config["collection"]
      collection      = site.collections[collection_name]

      if collection.nil?
        Jekyll.logger.warn "Faceted pagination:", "no collection '#{collection_name}' (from #{source_page.path})"
        return
      end

      per_page    = (config["per_page"] || 10).to_i
      sort_field  = config["sort_field"] || "date"
      reverse     = config.fetch("sort_reverse", true)
      facet_field = config["facet_field"]

      docs = collection.docs.reject { |d| d.data["published"] == false }
      docs = docs.sort_by { |d| d.data[sort_field].to_s }
      docs = docs.reverse if reverse

      base_reldir = File.dirname(source_page.relative_path)

      facet_values = [nil]
      facet_values.concat(docs.flat_map { |d| Array(d.data[facet_field]) }.compact.uniq.sort) if facet_field

      # Pass 1: create every page (or reuse the source page for the
      # unfiltered facet's page 1) so real, final URLs exist to link to.
      registry = {}

      facet_values.each do |facet_value|
        facet_docs = facet_value.nil? ? docs : docs.select { |d| Array(d.data[facet_field]).include?(facet_value) }
        next if facet_docs.empty? && !facet_value.nil?

        facet_slug    = facet_value.nil? ? nil : Jekyll::Utils.slugify(facet_value.to_s)
        facet_reldir  = facet_slug.nil? ? base_reldir : File.join(base_reldir, facet_slug)
        chunks        = facet_docs.each_slice(per_page).to_a
        chunks        = [[]] if chunks.empty?

        chunks.each_with_index do |items, index|
          page_num = index + 1

          page =
            if page_num == 1 && facet_value.nil?
              source_page
            else
              reldir  = page_num == 1 ? facet_reldir : File.join(facet_reldir, "page", page_num.to_s)
              new_pg  = PaginatedPage.new(site, reldir, source_page)
              site.pages << new_pg
              new_pg
            end

          page.data["pagination_items"] = items
          registry[[facet_value, page_num]] = { page: page, total: chunks.size }
        end
      end

      # Pass 2: now that every page has a real url, wire up prev/next
      # and the facet pill links.
      registry.each do |(facet_value, page_num), entry|
        page  = entry[:page]
        total = entry[:total]

        prev_entry = registry[[facet_value, page_num - 1]]
        next_entry = registry[[facet_value, page_num + 1]]
        base_entry = registry[[facet_value, 1]]

        facets = nil
        if facet_field
          facets = facet_values.map do |fv|
            fv_entry = registry[[fv, 1]]
            next nil unless fv_entry

            fv_docs = fv.nil? ? docs : docs.select { |d| Array(d.data[facet_field]).include?(fv) }
            {
              "name"   => fv.nil? ? "All" : fv.to_s,
              "url"    => fv_entry[:page].url,
              "count"  => fv_docs.size,
              "active" => fv == facet_value,
            }
          end.compact
        end

        page.data["pager"] = {
          "page_num"    => page_num,
          "total_pages" => total,
          "prev_url"    => prev_entry && prev_entry[:page].url,
          "next_url"    => next_entry && next_entry[:page].url,
          "base_url"    => base_entry && base_entry[:page].url,
          "facets"      => facets,
        }
      end
    end
  end
end
