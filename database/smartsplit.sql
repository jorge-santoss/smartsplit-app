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
    CONSTRAINT fk_households_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE household_members(
    household_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    role ENUM ('owner', 'member') NOT NULL DEFAULT  'member',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (household_id, user_id),
    CONSTRAINT fk_household_members_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAINT fk_household_members_user FOREIGN KEY (household_id) REFERENCES users(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categories(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    household_id INT UNSIGNED NOT NULL,
    name VARCHAR(60) NOT NULL,
    created_by INT UNSIGNED NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_category_household_name (household_id, name),
    CONSTRAINT fk_categories_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAINT fk_categories_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE expenses(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    household_id INT UNSIGNED NOT NULL,
    title VARCHAR(120) NOT NULL,
    note VARCHAR(500) NULL,
    amount DECIMAL(12,2) NOT NULL,
    expense_date DATE NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    payer_id INT UNSIGNED NOT null,
    split_type ENUM('equal', 'exact', 'percentage') NOT NULL,
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_expenses_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAINT fk_expenses_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_expenses_payer FOREIGN KEY (payer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_expenses_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE expense_splits(
    expense_id INT UNSIGNED NOT NULL,
    member_id INT   UNSIGNED NOT NULL,
    amout DECIMAL(12,2) NOT NULL,
    percentage DECIMAL(7,2) NOT NULL,
    PRIMARY KEY(expense_id, member_id),
    CONSTRAINT fk_expense_splits_expense FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_splits_memeber FOREIGN KEY (memeber_id) REFERENCES users(id) ON DELETE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE settlements(
    id INT UNSIGNED NOT NULL,
    household_id INT UNSIGNED NOT NULL,
    from_user_id INT UNSIGNED NOT NULL,
    to_user_id INT UNSIGNED NOT NULL
    amount DECIMAL(12,2) NOT NULL,
    serttlement_date DATE NOT NULL,
    note VARCHAR(500) NULL,
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_settlements_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAINT fk_settlements_from_user FOREIGN key (from_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_settlements_to_user FOREIGN key (to_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONsTRAINT fk_settlements_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT 
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_espenses_household_date ON expenses (household_id, expense_date);
CREATE INDEX idx_settlements_household_date ON settlements (household_id, settlement_date);