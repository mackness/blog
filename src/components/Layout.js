import React from 'react'
import { Link } from 'gatsby'

import { rhythm, scale } from '../utils/typography'

class Layout extends React.Component {
  render() {
    const { location, title, children } = this.props
    const rootPath = `${__PATH_PREFIX__}/`
    const isRoot = location.pathname === rootPath
    let header

    if (isRoot) {
      header = (
        <h1
          style={{
            ...scale(1.5),
            marginBottom: rhythm(2),
            textDecoration: 'none',
            marginTop: 0,
            boxShadow: `none`,
            textDecoration: `none`,
            color: `inherit`,
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: `inherit`,
              textDecorationLine: 'underline',
              textDecorationStyle: 'wavy',
              textDecorationColor: '#6200EA',
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h1>
      )
    } else {
      header = (
        <h3
          style={{
            marginTop: 0,
            marginBottom: rhythm(1),
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: `inherit`,
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h3>
      )
    }
    return (
      <div
        style={{
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
          margin: '0 auto',
        }}
      >
        {header}
        {children}
        <footer>© 2019, Powered by ☕</footer>
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '0 4px',
            fontSize: '10px',
            textAlign: 'right',
            background: '#6200EA',
            color: '#fff',
          }}
        >
          {new Date().toTimeString()}
        </div>
      </div>
    )
  }
}

export default Layout
