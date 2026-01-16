import '#style.css'
import $ from 'jquery'

const HN_API = 'https://hacker-news.firebaseio.com/v0'

interface Item {
  id: number
  title?: string
  text?: string
  url?: string
  score?: number
  by: string
  time: number
  descendants?: number
  kids?: number[]
  type: string
  dead?: boolean
  deleted?: boolean
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp)
  if (seconds < 60) return `${seconds} seconds ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

function getDomain(url?: string): string {
  if (!url) return ''
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return ''
  }
}

async function fetchItem(id: number): Promise<Item> {
  return $.getJSON(`${HN_API}/item/${id}.json`)
}

async function fetchTopStories(count = 30): Promise<Item[]> {
  const ids: number[] = await $.getJSON(`${HN_API}/topstories.json`)
  const stories = await Promise.all(ids.slice(0, count).map(fetchItem))
  return stories.filter(s => s && s.type === 'story')
}

async function fetchComments(ids: number[]): Promise<JQuery> {
  const $container = $('<div>').addClass('hn-comments')

  if (!ids || ids.length === 0) return $container

  const items = await Promise.all(ids.map(fetchItem))

  for (const item of items) {
    if (!item || item.deleted || item.dead) continue

    const $comment = $('<div>').addClass('hn-comment')

    $comment.append(
      $('<div>')
        .addClass('hn-comment-meta')
        .append(
          $('<a>')
            .addClass('hn-comment-author')
            .attr('href', `https://news.ycombinator.com/user?id=${item.by}`)
            .text(item.by),
          $('<span>').text(` ${timeAgo(item.time)} `),
          $('<a>')
            .addClass('hn-toggle')
            .text('[-]')
            .on('click', function () {
              const $text = $(this)
                .closest('.hn-comment')
                .find('.hn-comment-text, .hn-comment-children')
                .first()
              const $children = $(this)
                .closest('.hn-comment')
                .find('.hn-comment-children')
                .first()
              if ($(this).text() === '[-]') {
                $(this).text('[+]')
                $text.hide()
                $children.hide()
              } else {
                $(this).text('[-]')
                $text.show()
                $children.show()
              }
            }),
        ),
      $('<div>')
        .addClass('hn-comment-text')
        .html(item.text || ''),
    )

    if (item.kids && item.kids.length > 0) {
      const $children = $('<div>').addClass('hn-comment-children')
      $comment.append($children)
      fetchComments(item.kids).then($childComments => {
        $children.append($childComments.children())
      })
    }

    $container.append($comment)
  }

  return $container
}

function renderStory(story: Item, rank: number): JQuery {
  const domain = getDomain(story.url)
  const titleUrl = story.url || '#'

  const $row = $('<tr>').addClass('hn-story')

  $row.append(
    $('<td>').addClass('hn-rank').text(`${rank}.`),
    $('<td>')
      .addClass('hn-vote')
      .append($('<div>').addClass('hn-upvote').attr('title', 'upvote')),
    $('<td>')
      .addClass('hn-story-content')
      .append(
        $('<div>')
          .addClass('hn-story-title')
          .append(
            $('<a>')
              .attr('href', titleUrl)
              .text(story.title ?? ''),
            ...(domain
              ? [$('<span>').addClass('hn-domain').text(`(${domain})`)]
              : []),
          ),
        $('<div>')
          .addClass('hn-subtext')
          .append(
            $('<span>').text(`${story.score} points by `),
            $('<a>')
              .attr('href', `https://news.ycombinator.com/user?id=${story.by}`)
              .text(story.by),
            $('<span>').text(` ${timeAgo(story.time)} | `),
            $('<a>')
              .addClass('hn-comments-link')
              .attr('href', '#')
              .text(`${story.descendants || 0} comments`)
              .data('story-id', story.id),
          ),
      ),
  )

  return $row
}

function renderHeader(): JQuery {
  return $('<tr>')
    .attr('id', 'hn-header')
    .append(
      $('<td>')
        .attr('colspan', 3)
        .append(
          $('<span>')
            .attr('id', 'hn-header-left')
            .append(
              $('<a>').attr('id', 'hn-logo').text('Y'),
              $('<a>').attr('id', 'hn-site-name').text('Hacker News'),
              $('<span>')
                .attr('id', 'hn-nav')
                .append(
                  $('<a>')
                    .attr('href', 'https://news.ycombinator.com/newest')
                    .text('new'),
                  $('<span>').addClass('separator').text(' | '),
                  $('<a>')
                    .attr('href', 'https://news.ycombinator.com/front')
                    .text('past'),
                  $('<span>').addClass('separator').text(' | '),
                  $('<a>')
                    .attr('href', 'https://news.ycombinator.com/newcomments')
                    .text('comments'),
                  $('<span>').addClass('separator').text(' | '),
                  $('<a>')
                    .attr('href', 'https://news.ycombinator.com/ask')
                    .text('ask'),
                  $('<span>').addClass('separator').text(' | '),
                  $('<a>')
                    .attr('href', 'https://news.ycombinator.com/show')
                    .text('show'),
                  $('<span>').addClass('separator').text(' | '),
                  $('<a>')
                    .attr('href', 'https://news.ycombinator.com/jobs')
                    .text('jobs'),
                  $('<span>').addClass('separator').text(' | '),
                  $('<a>')
                    .attr('href', 'https://news.ycombinator.com/submit')
                    .text('submit'),
                ),
            ),
          $('<span>')
            .attr('id', 'hn-header-right')
            .append(
              $('<a>')
                .attr('href', 'https://news.ycombinator.com/login')
                .text('login'),
            ),
        ),
    )
}

function renderFooter(): JQuery {
  return $('<tr>')
    .attr('id', 'hn-footer')
    .append(
      $('<td>')
        .attr('colspan', 3)
        .append(
          $('<div>')
            .attr('id', 'hn-footer-nav')
            .append(
              $('<a>')
                .attr(
                  'href',
                  'https://news.ycombinator.com/newsguidelines.html',
                )
                .text('Guidelines'),
              $('<span>').text(' | '),
              $('<a>')
                .attr('href', 'https://news.ycombinator.com/newsfaq.html')
                .text('FAQ'),
              $('<span>').text(' | '),
              $('<a>')
                .attr('href', 'https://news.ycombinator.com/lists')
                .text('Lists'),
              $('<span>').text(' | '),
              $('<a>')
                .attr('href', 'https://github.com/HackerNews/API')
                .text('API'),
              $('<span>').text(' | '),
              $('<a>')
                .attr('href', 'https://news.ycombinator.com/security.html')
                .text('Security'),
              $('<span>').text(' | '),
              $('<a>')
                .attr('href', 'https://www.ycombinator.com/legal/')
                .text('Legal'),
              $('<span>').text(' | '),
              $('<a>')
                .attr('href', 'https://www.ycombinator.com/apply/')
                .text('Apply to YC'),
              $('<span>').text(' | '),
              $('<a>')
                .attr('href', 'mailto:hn@ycombinator.com')
                .text('Contact'),
            ),
          $('<div>')
            .attr('id', 'hn-search')
            .append(
              $('<span>').text('Search: '),
              $('<input>').attr({
                id: 'hn-search-input',
                type: 'text',
                placeholder: 'Search HN...',
              }),
            ),
        ),
    )
}

async function showComments(storyId: number) {
  const story = await fetchItem(storyId)
  const domain = getDomain(story.url)

  const $content = $('#hn-content')
  $content.empty()

  // Story header
  const $storyHeader = $('<div>')
    .attr('id', 'hn-story-header')
    .append(
      $('<div>')
        .addClass('hn-story-title')
        .append(
          $('<a>')
            .attr('href', story.url || '#')
            .text(story.title ?? ''),
          ...(domain
            ? [$('<span>').addClass('hn-domain').text(` (${domain})`)]
            : []),
        ),
      $('<div>')
        .addClass('hn-subtext')
        .append(
          $('<span>').text(`${story.score} points by `),
          $('<a>')
            .attr('href', `https://news.ycombinator.com/user?id=${story.by}`)
            .text(story.by),
          $('<span>').text(` ${timeAgo(story.time)} | `),
          $('<span>').text(`${story.descendants || 0} comments`),
        ),
    )

  // Back link
  const $backLink = $('<div>')
    .attr('id', 'hn-back')
    .append(
      $('<a>')
        .attr('href', '#')
        .text('← back to stories')
        .on('click', e => {
          e.preventDefault()
          showStories()
        }),
    )

  const $commentsContainer = $('<div>')
    .attr('id', 'hn-comments-container')
    .text('Loading comments...')

  $content.append($backLink, $storyHeader, $commentsContainer)

  // Fetch and render comments
  if (story.kids && story.kids.length > 0) {
    const $comments = await fetchComments(story.kids)
    $commentsContainer.empty().append($comments)
  } else {
    $commentsContainer.text('No comments yet.')
  }
}

async function showStories() {
  const $content = $('#hn-content')
  $content.empty().text('Loading stories...')

  const stories = await fetchTopStories(30)

  const $storiesTable = $('<table>').attr('id', 'hn-stories-table')
  const $tbody = $('<tbody>')

  stories.forEach((story, i) => {
    $tbody.append(renderStory(story, i + 1))
  })

  $storiesTable.append($tbody)
  $content.empty().append($storiesTable)

  // Upvote click handler
  $('.hn-upvote').on('click', function () {
    $(this).toggleClass('voted')
  })

  // Comments click handler
  $('.hn-comments-link').on('click', function (e) {
    e.preventDefault()
    const storyId = $(this).data('story-id')
    showComments(storyId)
  })
}

$(() => {
  const $container = $('<table>').attr('id', 'hn-container')
  const $tbody = $('<tbody>')

  $tbody.append(renderHeader())
  $tbody.append(
    $('<tr>').append($('<td>').attr({ colspan: 3, id: 'hn-content' })),
  )
  $tbody.append(renderFooter())

  $container.append($tbody)
  $('body').append($container)

  // Make logo/site name navigate back to stories
  $('#hn-logo, #hn-site-name')
    .on('click', e => {
      e.preventDefault()
      showStories()
    })
    .attr('href', '#')
    .css('cursor', 'pointer')

  showStories()
})
