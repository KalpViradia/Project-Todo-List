CREATE DATABASE TodoDB;

USE TodoDB;

CREATE TABLE Tasks (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000),
    Priority NVARCHAR(50),
    DueDate DATE,
    Completed BIT DEFAULT 0,
    Status NVARCHAR(50)
);

INSERT INTO Tasks (Title, Description, Priority, DueDate, Completed, Status)
VALUES
('Buy Groceries', 'Milk, Bread, Eggs, Fruits', 'High', '2025-05-01', 0, 'Incomplete'),
('Finish Angular Project', 'Complete the Todo List application', 'Medium', '2025-05-03', 0, 'Incomplete'),
('Call the Bank', 'Inquire about loan details', 'Low', '2025-04-28', 0, 'Overdue'),
('Doctor Appointment', 'Annual health checkup at 10 AM', 'High', '2025-04-30', 0, 'Incomplete'),
('Read a Book', 'Finish reading "Atomic Habits"', 'Low', '2025-05-10', 0, 'Incomplete'),
('Workout', '1-hour cardio session', 'Medium', '2025-04-28', 1, 'Completed');

SELECT * FROM Tasks;

DELETE FROM Tasks WHERE 1 = 1;

CREATE LOGIN myuser WITH PASSWORD = 'mypassword';
CREATE USER myuser FOR LOGIN myuser;
ALTER ROLE db_owner ADD MEMBER myuser;
GRANT CONTROL ON DATABASE::TodoDB TO myuser;

SELECT 'Data Source=' + @@SERVERNAME + ';Initial Catalog=' + DB_NAME() + ';Integrated Security=True;' AS ConnectionString;

CREATE OR ALTER PROCEDURE sp_ToggleTaskCompletion
    @TaskId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the task exists
    IF NOT EXISTS (SELECT 1 FROM Tasks WHERE Id = @TaskId)
    BEGIN
        RAISERROR('Task not found', 16, 1);
        RETURN;
    END

    DECLARE @Completed BIT;
    DECLARE @DueDate DATE;
    DECLARE @NewCompleted BIT;
    DECLARE @NewStatus NVARCHAR(50);

    -- Get current completion and due date
    SELECT @Completed = Completed, @DueDate = DueDate
    FROM Tasks
    WHERE Id = @TaskId;

    -- Toggle the completed value
    SET @NewCompleted = CASE WHEN @Completed = 1 THEN 0 ELSE 1 END;

    -- Calculate the new status
    IF @NewCompleted = 1
        SET @NewStatus = 'Completed';
    ELSE IF @DueDate < CAST(GETDATE() AS DATE)
        SET @NewStatus = 'Overdue';
    ELSE
        SET @NewStatus = 'Incomplete';

    -- Update the task
    UPDATE Tasks
    SET Completed = @NewCompleted,
        Status = @NewStatus
    WHERE Id = @TaskId;

    -- Optionally return updated task
    SELECT *
    FROM Tasks
    WHERE Id = @TaskId;
END;

EXEC sp_ToggleTaskCompletion @TaskId = 18;

SELECT * FROM Tasks;
