import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import Image from 'gatsby-image'

import { rhythm } from '../utils/typography'

function Bio({location}) {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRoot = location.pathname === rootPath;
  const IAMGE_DIMENSION = isRoot ? 75 : 50;
  return (
    <StaticQuery
      query={bioQuery}
      render={data => {
        const { author, social } = data.site.siteMetadata
        return (
          <div
            style={{
              display: `flex`,
              marginBottom: rhythm(.5)
            }}
          >
            <Image
              fixed={data.avatar.childImageSharp.fixed}
              alt={author}
              style={{
                marginRight: rhythm(1 / 2),
                marginBottom: 0,
                maxWidth: IAMGE_DIMENSION,
                maxHeight: IAMGE_DIMENSION,
                borderRadius: `100%`
              }}
            />
            <p>
              Written by <strong>{author}</strong> who lives and works in Westwood,
              {` `}
              <a href={`https://twitter.com/${social.twitter}`}>
                follow me on Twitter
              </a>
            </p>
          </div>
        )
      }}
    />
  )
}

const bioQuery = graphql`
  query BioQuery {
    avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
      childImageSharp {
        fixed(width: 150, height: 150) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    site {
      siteMetadata {
        author
        social {
          twitter
        }
      }
    }
  }
`

export default Bio
