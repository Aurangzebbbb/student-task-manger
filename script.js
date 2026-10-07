<script src="script.js">

"use strict";


/* =====================================================
   STORAGE
   ===================================================== */

const STORAGE_KEY = "studentTaskManagerTasks";


/* =====================================================
   GET HTML ELEMENTS
   ===================================================== */

const taskForm =
    document.getElementById("taskForm");

const taskInput =
    document.getElementById("taskInput");

const priorityInput =
    document.getElementById("priorityInput");

const dateInput =
    document.getElementById("dateInput");

const searchInput =
    document.getElementById("searchInput");

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

const taskCount =
    document.getElementById("taskCount");

const filterButtons =
    document.querySelectorAll(".filter-btn");


/* =====================================================
   APPLICATION DATA
   ===================================================== */

let tasks = loadTasks();

let currentFilter = "all";

let searchText = "";


/* =====================================================
   LOAD TASKS FROM LOCAL STORAGE
   ===================================================== */

function loadTasks() {

    try {

        const savedTasks =
            localStorage.getItem(STORAGE_KEY);


        if (!savedTasks) {

            return [];
        }


        const parsedTasks =
            JSON.parse(savedTasks);


        if (Array.isArray(parsedTasks)) {

            return parsedTasks;
        }


        return [];

    } catch (error) {

        console.error(
            "Could not load tasks:",
            error
        );

        return [];
    }
}


/* =====================================================
   SAVE TASKS
   ===================================================== */

function saveTasks() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );
}


/* =====================================================
   CREATE A NEW TASK
   ===================================================== */

function createTask(
    title,
    priority,
    dueDate
) {

    return {

        id:
            Date.now().toString()
            +
            Math.random()
                .toString(36)
                .substring(2, 8),

        title: title.trim(),

        priority: priority,

        dueDate: dueDate,

        completed: false,

        createdAt:
            new Date().toISOString()
    };
}


/* =====================================================
   ADD TASK
   ===================================================== */

taskForm.addEventListener(
    "submit",
    function (event) {

        /*
         Prevent the browser from
         refreshing the page.
        */

        event.preventDefault();


        const title =
            taskInput.value.trim();


        /*
         Do not add an empty task.
        */

        if (!title) {

            taskInput.focus();

            return;
        }


        /*
         Create task object.
        */

        const newTask =
            createTask(
                title,
                priorityInput.value,
                dateInput.value
            );


        /*
         Put newest task
         at the beginning.
        */

        tasks.unshift(newTask);


        /*
         Save to browser.
        */

        saveTasks();


        /*
         Update screen.
        */

        renderTasks();


        /*
         Clear form.
        */

        taskForm.reset();


        /*
         Reset priority because
         form.reset() returns it
         to its HTML default.
        */

        priorityInput.value = "medium";


        /*
         Put cursor back
         into task input.
        */

        taskInput.focus();
    }
);


/* =====================================================
   SEARCH
   ===================================================== */

searchInput.addEventListener(
    "input",
    function () {

        searchText =
            searchInput.value
                .trim()
                .toLowerCase();


        renderTasks();
    }
);


/* =====================================================
   FILTER BUTTONS
   ===================================================== */

filterButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                currentFilter =
                    button.dataset.filter;


                /*
                 Remove active
                 from all buttons.
                */

                filterButtons.forEach(
                    function (item) {

                        item.classList.toggle(
                            "active",
                            item === button
                        );
                    }
                );


                renderTasks();
            }
        );
    }
);


/* =====================================================
   COMPLETE / DELETE BUTTONS
   ===================================================== */

taskList.addEventListener(
    "click",
    function (event) {

        /*
         Find the button
         that was clicked.
        */

        const button =
            event.target.closest("button");


        if (!button) {

            return;
        }


        /*
         Find the task containing
         that button.
        */

        const taskItem =
            button.closest(".task-item");


        if (!taskItem) {

            return;
        }


        const taskId =
            taskItem.dataset.id;


        /*
         Delete task.
        */

        if (
            button.classList.contains(
                "delete-btn"
            )
        ) {

            deleteTask(taskId);
        }


        /*
         Complete / undo task.
        */

        if (
            button.classList.contains(
                "complete-btn"
            )
        ) {

            toggleTask(taskId);
        }
    }
);


/* =====================================================
   CHECKBOX COMPLETION
   ===================================================== */

taskList.addEventListener(
    "change",
    function (event) {

        if (
            !event.target.classList.contains(
                "complete-check"
            )
        ) {

            return;
        }


        const taskItem =
            event.target.closest(
                ".task-item"
            );


        if (taskItem) {

            toggleTask(
                taskItem.dataset.id
            );
        }
    }
);


/* =====================================================
   MARK TASK COMPLETED / UNCOMPLETED
   ===================================================== */

function toggleTask(taskId) {

    const task =
        tasks.find(
            function (item) {

                return item.id === taskId;
            }
        );


    if (!task) {

        return;
    }


    /*
     true → false
     false → true
    */

    task.completed =
        !task.completed;


    saveTasks();

    renderTasks();
}


/* =====================================================
   DELETE TASK
   ===================================================== */

function deleteTask(taskId) {

    tasks =
        tasks.filter(
            function (task) {

                return task.id !== taskId;
            }
        );


    saveTasks();

    renderTasks();
}


/* =====================================================
   GET TASKS THAT SHOULD BE SHOWN
   ===================================================== */

function getVisibleTasks() {

    return tasks.filter(
        function (task) {


            /*
             Check search.
            */

            const matchesSearch =
                task.title
                    .toLowerCase()
                    .includes(searchText);


            /*
             Check selected filter.
            */

            let matchesFilter = true;


            if (
                currentFilter === "active"
            ) {

                matchesFilter =
                    !task.completed;
            }


            else if (
                currentFilter === "completed"
            ) {

                matchesFilter =
                    task.completed;
            }


            /*
             Task must satisfy
             BOTH conditions.
            */

            return (
                matchesSearch &&
                matchesFilter
            );
        }
    );
}


/* =====================================================
   FORMAT DATE
   ===================================================== */

function formatDate(dateString) {

    if (!dateString) {

        return "No due date";
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Invalid date";
    }


    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


/* =====================================================
   PROTECT USER TEXT
   ===================================================== */

function escapeHTML(value) {

    return value.replace(
        /[&<>"']/g,
        function (character) {

            const entities = {

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#039;"
            };


            return entities[character];
        }
    );
}


/* =====================================================
   DISPLAY TASKS
   ===================================================== */

function renderTasks() {

    const visibleTasks =
        getVisibleTasks();


    /*
     Clear existing list.
    */

    taskList.innerHTML = "";


    /*
     Create each task.
    */

    visibleTasks.forEach(
        function (task) {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "task-item";


            if (task.completed) {

                item.classList.add(
                    "completed"
                );
            }


            item.dataset.id =
                task.id;


            /*
             Create task HTML.
            */

            item.innerHTML = `

                <input
                    class="complete-check"
                    type="checkbox"
                    ${task.completed ? "checked" : ""}
                    aria-label="Mark task as ${
                        task.completed
                            ? "active"
                            : "completed"
                    }"
                >


                <div class="task-content">

                    <p class="task-title">
                        ${escapeHTML(task.title)}
                    </p>


                    <div class="task-meta">

                        <span
                            class="priority priority-${task.priority}"
                        >
                            ${escapeHTML(task.priority)}
                        </span>


                        <span>
                            Due:
                            ${escapeHTML(
                                formatDate(
                                    task.dueDate
                                )
                            )}
                        </span>

                    </div>

                </div>


                <div class="task-actions">

                    <button
                        class="complete-btn"
                        type="button"
                    >
                        ${
                            task.completed
                                ? "Undo"
                                : "Complete"
                        }
                    </button>


                    <button
                        class="delete-btn"
                        type="button"
                    >
                        Delete
                    </button>

                </div>
            `;


            taskList.appendChild(item);
        }
    );


    /*
     Update number of tasks.
    */

    updateTaskCount();


    /*
     Display correct empty message.
    */

    if (
        visibleTasks.length === 0
    ) {

        emptyState.hidden = false;


        if (tasks.length === 0) {

            emptyState.textContent =
                "No tasks yet. Add your first task above.";
        }


        else if (searchText) {

            emptyState.textContent =
                "No tasks match your search.";
        }


        else if (
            currentFilter === "active"
        ) {

            emptyState.textContent =
                "You have no active tasks.";
        }


        else if (
            currentFilter === "completed"
        ) {

            emptyState.textContent =
                "You have no completed tasks.";
        }

    }

    else {

        emptyState.hidden = true;
    }
}


/* =====================================================
   UPDATE TASK COUNTER
   ===================================================== */

function updateTaskCount() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function (task) {

                return task.completed;
            }
        ).length;


    if (total === 0) {

        taskCount.textContent =
            "0 tasks";

        return;
    }


    taskCount.textContent =
        `${total} ${
            total === 1
                ? "task"
                : "tasks"
        } • ${completed} completed`;
}


/* =====================================================
   START APPLICATION
   ===================================================== */

renderTasks();