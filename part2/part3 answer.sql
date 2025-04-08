    drop table Person;
    drop table FamilyTree;
   
CREATE TABLE Person (
    Person_Id INT PRIMARY KEY,
    Personal_Name VARCHAR(255),
    Family_Name VARCHAR(255),
    Gender VARCHAR(10),
    Father_Id INT NULL,
    Mother_Id INT NULL,
    Spouse_Id INT NULL
);

CREATE TABLE FamilyTree (
    Person_Id INT,
    Relative_Id INT,
    Connection_Type VARCHAR(255),
    PRIMARY KEY (Person_Id, Relative_Id),
    CONSTRAINT CHK_Connection_Type 
        CHECK (Connection_Type IN ('Father', 'Mother', 'Son', 'Daughter', 'Spouse', 'Brother', 'Sister'))
);


INSERT INTO Person (Person_Id, Personal_Name, Family_Name, Gender, Father_Id, Mother_Id, Spouse_Id) VALUES
(10, 'd', 'ff', 'male', NULL, NULL, NULL),
(11, 'r', 'ff', 'female', NULL, NULL, 10);



DELIMITER //
CREATE TRIGGER trg_Person_AfterInsert
AFTER INSERT ON Person
FOR EACH ROW
BEGIN
    -- father relationship
    IF NEW.Father_Id IS NOT NULL THEN
        INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
        VALUES (NEW.Person_Id, NEW.Father_Id, 'Father');
        
        INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
        VALUES (NEW.Father_Id, NEW.Person_Id, 
            CASE NEW.Gender 
                WHEN 'female' THEN 'Daughter'
                ELSE 'Son'
            END);
	    
    END IF;

    --  mother relationship
    IF NEW.Mother_Id IS NOT NULL THEN
        INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
        VALUES (NEW.Person_Id, NEW.Mother_Id, 'Mother');
        
        INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
        VALUES (NEW.Mother_Id, NEW.Person_Id, 
            CASE NEW.Gender 
                WHEN 'female' THEN 'Daughter'
                ELSE 'Son'
            END);
    END IF;

    -- spouse relationship
    IF NEW.Spouse_Id IS NOT NULL THEN
        INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
        VALUES (NEW.Person_Id, NEW.Spouse_Id, 'Spouse')
	    ON DUPLICATE KEY UPDATE Connection_Type = 'Spouse';

        
        INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
        VALUES (NEW.Spouse_Id, NEW.Person_Id, 'Spouse')
		ON DUPLICATE KEY UPDATE Connection_Type = 'Spouse';

    END IF;
    
-- brother/sister relationship - same father
    IF NEW.Father_Id IS NOT NULL THEN
        -- Insert both directions with correct gender labels
        INSERT IGNORE INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
        SELECT NEW.Person_Id, p.Person_Id,
            CASE p.Gender 
                WHEN 'female' THEN 'Sister'
                ELSE 'Brother'
            END
        FROM Person p
        WHERE p.Person_Id != NEW.Person_Id
        AND p.Father_Id = NEW.Father_Id;

        INSERT IGNORE INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
        SELECT p.Person_Id, NEW.Person_Id,
            CASE NEW.Gender 
                WHEN 'female' THEN 'Sister'
                ELSE 'Brother'
            END
        FROM Person p
        WHERE p.Person_Id != NEW.Person_Id
        AND p.Father_Id = NEW.Father_Id;
    END IF;

    -- brother/sister relationship - same mother
    IF NEW.Mother_Id IS NOT NULL THEN
        -- Insert both directions with correct gender labels
        INSERT IGNORE INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
        SELECT NEW.Person_Id, p.Person_Id,
            CASE p.Gender 
                WHEN 'female' THEN 'Brother'
                ELSE 'Sister'
            END
        FROM Person p
        WHERE p.Person_Id != NEW.Person_Id
        AND p.Mother_Id = NEW.Mother_Id;

        INSERT IGNORE INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
        SELECT p.Person_Id, NEW.Person_Id,
            CASE NEW.Gender 
                WHEN 'female' THEN 'Sister'
                ELSE 'Brother'
            END
        FROM Person p
        WHERE p.Person_Id != NEW.Person_Id
        AND p.Mother_Id = NEW.Mother_Id;
    END IF;END//
DELIMITER ;


-- part 2
INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
SELECT p1.Person_Id, p1.Spouse_Id, 'Spouse'
FROM Person p1
WHERE p1.Spouse_Id IS NOT NULL
AND NOT EXISTS (
    SELECT *
    FROM FamilyTree ft
    WHERE ft.Person_Id = p1.Person_Id 
    AND ft.Relative_Id = p1.Spouse_Id
);

-- Create the reverse relationships
INSERT INTO FamilyTree (Person_Id, Relative_Id, Connection_Type)
SELECT p1.Spouse_Id, p1.Person_Id, 'Spouse'
FROM Person p1
WHERE p1.Spouse_Id IS NOT NULL
AND NOT EXISTS (
    SELECT * 
    FROM FamilyTree ft
    WHERE ft.Person_Id = p1.Spouse_Id 
    AND ft.Relative_Id = p1.Person_Id
);

INSERT INTO Person (Person_Id, Personal_Name, Family_Name, Gender, Father_Id, Mother_Id, Spouse_Id) VALUES
(1, 'David', 'Cohen', 'male', NULL, NULL, 2),
(2, 'Sarah', 'Cohen', 'female', NULL, NULL, 1),
(3, 'Michael', 'Cohen', 'male', 1, 2, NULL),
(4, 'Rachel', 'Levi', 'female', NULL, NULL, 5),
(5, 'Daniel', 'Levi', 'male', NULL, NULL, 4),
(6, 'Mali' , 'Horowitz', 'female', 1, 2, NULL ),
(7, 'hh' , 'tt', 'male' , NULL, NULL, 6);

INSERT INTO Person (Person_Id, Personal_Name, Family_Name, Gender, Father_Id, Mother_Id, Spouse_Id) VALUES
(8, 'gg', 'tt', 'male', NULL, NULL, 9),
(9, 'aa', 'tt', 'female', NULL, NULL, 8);



select * from Person;
select * from FamilyTree;

