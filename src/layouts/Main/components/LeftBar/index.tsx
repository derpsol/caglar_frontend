/**
 * LeftBar component.
 */
import React from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from '@reach/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import contact from '../../../../data/contact.json';
import styles from './styles';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

const useStyles = createUseStyles(styles);

const LeftBar: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div>
        {/* Home button */}
        <Link
          className={classes.item}
          key="main-page"
          to="/"
          aria-label="Main page"
          title="Main page"
        >
          <FontAwesomeIcon className={classes.icon} icon="home" size="lg" />
        </Link>
        {/* Contact buttons */}
        {contact.map(({ name, url, icon }) => (
          <a
            className={classes.item}
            key={`left-bar-${name}`}
            href={url}
            aria-label={`Find me on ${name}`}
            title={`Find me on ${name}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon
              className={classes.icon}
              icon={icon as IconProp}
              size="lg"
            />
          </a>
        ))}
      </div>
      <div>
        <span className={classes.item} title="Useless button!">
          <FontAwesomeIcon icon="cog" size="lg" />
        </span>
      </div>
    </div>
  );
};

export default LeftBar;
