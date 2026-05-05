DROP TABLE IF EXISTS settlements;
DROP TABLES IF EXISTS expense_splits;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS household_members;
DROP TABLE IF EXISTS households;
DROP TABLE IF EXISTS users; 

CREATE TABLE users (
    id INT UNSIGNED AUTO INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR (255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 

CREATE TABLE households (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY?
    name VARCHAR (100) NOT NULL?
    description VARCHAR (255) NOT NULL,
    owner_id INT  UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL CURRENT_TIMESTAMP,
    CONSTRAIT fk_households_owner FOREING KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE household_members(
    household_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    role ENUM ('owner', 'member') NOT NULL DEFAULT  'member',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (household_id, user_id),
    CONSTRAIT fk_household_members_household FOREING KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAIT fk_household_members_user FOREING KEY (household_id) REFERENCES users(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categories(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    household_id INT UNSIGNED NOT NULL,
    name VARCHAR(60) NOT NULL,
    created_by INT UNSIGNED NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_category_household_name (household_id, name),
    CONSTRAIT fk_categories_household FOREING KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAIT fk_categories_creator FOREING KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4