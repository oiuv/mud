虽然MUD游戏多数只使用到`save_object()`存档数据，但总有一些情况我们需要使用到mysql，存一些必要的数据到数据库中，LPC中提供了数据库操作的核心函数：`db_connect`、`db_exec`、`db_fetch`、`db_close`、`db_status`，可以满足我们所有数据库操作的需求，比如，像在游戏中读取bbs.mud.ren论坛的帖子，可以用以下代码实现：

```c
// 读取论坛内容
varargs string content(int id, string host, string db, string user)
{
#ifdef __PACKAGE_DB__
    if (id)
    {
        mixed handle;

        if (stringp(host) && stringp(db) && stringp(user))
        {
            handle = db_connect(host, db, user);
        }
        else
        {
            handle = db_connect("127.0.0.1", "mudren", "root");
        }

        if (stringp(handle)) /* error */
            return handle;
        else
        {
            mixed rows;

            db_exec(handle, "set names utf8"); // 防止乱码
            rows = db_exec(handle, "SELECT markdown FROM contents WHERE contentable_type LIKE '%Thread' AND contentable_id='" + id + "'");
            if (!rows)
            {
                db_close(handle);
                return "";
            }
            else if (stringp(rows)) /* error */
            {
                db_close(handle);
                return rows;
            }
            else
            {
                mixed *res;
                string content = "";

                for (int i = 1; i <= rows; i++)
                {
                    res = db_fetch(handle, i);
                    // write(res[0] + "\n");
                    content += res[0];
                }
                db_close(handle);
                return content;
            }
        }
    }
    else
    {
        return "请指定主题ID~";
    }
#else
    return "注意：数据库功能被禁用，无法读取论坛内容。";
#endif
}
```

代码看起来有一点多，想不想更优雅的操作数据库？看看以下实现相同功能的代码：

```c
inherit CORE_DB;
// 读取论坛内容
varargs string content(int id, string host, string db, string user)
{
#ifdef __PACKAGE_DB__
    if (id)
    {
        string content;

        if (stringp(host) && stringp(db) && stringp(user))
        {
            DB::setConnection(([
                "host":host,
                "database":db,
                "user":user,
            ]));
        }
        content = DB::table("contents")->where(({({"contentable_type", "LIKE", "%Thread"}), ({"contentable_id", id})}))->value("markdown");

        return content;
    }
    else
    {
        return "请指定主题ID~";
    }
#else
    return "注意：数据库功能被禁用，无法读取论坛内容。";
#endif
}
```


这个数据库API文件已集成在FluffOS驱动的STD代码中:[database.c]( https://github.com/fluffos/fluffos/blob/master/testsuite/std/database.c),可以直接复制这个文件到自己的LIB中使用然后继承`inherit DATABASE;`使用。

泥芯框架v1.3版开始自动提供这个API，可以`inherit CORD_DB;`使用。

API文档介绍如下：

----

## 基础配置

方式一：使用mudcore框架

当你需要使用数据库增删改查功能时，可直接使用`CORE_DB`(`/mudcore/inherit/DB`)：

首先，在你的`/data/`目录中新增环境配置文件`.env`（如果你用git做版本管理，这个文件一定要加到.gitignore中），文件内容增加以下配置：

```
DB_HOST : 127.0.0.1
DB_DATABASE : mud
DB_USERNAME : root
DB_PASSWORD : root
```

注意，`.env`文件中只是指定了数据库默认配置，如果不使用文件配置，也可以在初始化时配置。

```c
void test()
{
    /**
     * @brief 初始化数据库连接
     *
     */
    object DB = new(CORE_DB, host, db, user);

    // ...
}
```

或者使用 `setConnection()` 方法配置数据库：

```c
void test()
{
    object DB = new(CORE_DB);
    mapping db = ([
        "host":"127.0.0.1",
        "database":"mud",
        "user":"root",
    ]);
    DB->setConnection(db);
}
```

上以配置使用以的是系统默认数据库类型`__DEFAULT_DB__`，如果要指定数据库类型可以使用以下方式：

```c
void test()
{
    // 初始化时指定type
    object DB = new(CORE_DB, host, db, user, type);
    // 通过配置指定type(使用SQLITE3)
    mapping db = ([
        "host":"",
        "database":"/data/mudlite.db",
        "user":"",
        "type":__USE_SQLITE3__
    ]);
    DB->setConnection(db);
}
```

数据库类型可以使用宏定义：`__USE_MYSQL__`、`__USE_SQLITE3__`、`__USE_POSTGRE__`或`__DEFAULT_DB__`。

----

方式二：直接复制database.c到自己的项目

复制[database.c]( https://github.com/fluffos/fluffos/blob/master/testsuite/std/database.c)到自己的项目的`/inherit/database.c`中，并在`globals.h`中宏定义`#define DATABASE "/inherit/database.c"`，然后继承`inherit DATABASE;`或`new(DATABASE);`使用，通过`setConnection()`方式配置数据连接，具体可参考方式一中的示例。

## 查询

### 从数据表中查询所有行

使用`DB`对象的`table`方法指定要查询的数据表并返回一个查询对象，使用`get`方法获取所有结果，返回值为结果二维数组，示例代码：

```c
inherit CORE_DB;

void test()
{
    mixed res;

    // 获取 users 表的所有结果
    res = DB->table("users")->get();
    printf("%O\n", res);
}
```

### 从数据表中获取单行或单列

使用`first`方法可以获取查询结果的第一行，返回值为一维数组结果，如果指定数组做为参数，只查询指定的列，另外你可以使用`where`方法限制查询条件，核心代码：

```c
// 查询用户表中的第一条数据
res = DB->table("users")->first();
// 查询用户表中的第一条数据的name和email
res = DB->table("users")->first("name", "email");
// 查询用户表中用户名为 ivy 的数据
res = DB->table("users")->where("name", "ivy")->first();
```

如果不需要整行数据，则可以使用`value`方法从记录中获取单个值。该方法将直接返回该字段的值：

```c
// 获得用户 ivy 的 email
email = DB->table("users")->where("name", "ivy")->value("email");
// 获取随机用户的 email
email = DB->table("users")->inRandomOrder()->value("email");
```

如果是通过 id 字段值获取一行数据，可以使用 find 方法：

```c
// 获取 ID 为 1 的用户数据
res = DB->table("users")->find(1);
```

### 获取一列的值

如果你想获取单列数据的集合，则可以使用 pluck 方法。在下面的例子中，我们将获取角色表中所有邮箱：
```c
// 返回所有用户的邮箱数组
res = DB->table("users")->pluck("email");
```

### 聚合

查询构造器还提供了各种聚合方法，比如 `count`，`max`，`min`，`avg`，还有 `sum`。你可以在构造查询后调用任何方法：

```c
// 获取用户总数
users = DB->table("users")->count();
// 获取等级最高的用户
level = DB->table("users")->max("level");
```

同样，你可以通过条件查询限制聚合查询：

```c
// 返回ID为9的用户发贴的访问量之和
res = DB->table("topics")->where("user_id", 9)->sum("view_count");
// 判断用户mudren是否存在
count = DB->table("users")->where("name", "mudren")->count();
```

### Where Clauses

#### where 语句

在构造 `where` 查询实例中，你可以使用 `where` 方法。调用 `where` 最基本的方式是需要传递三个参数：第一个参数是列名，第二个参数是任意一个数据库系统支持的运算符，第三个是该列要比较的值。如：

```c
user = DB->table("users")->where("name", "=", "mudren")->get();
```

为了方便，如果你只是简单比较列值和给定数值是否相等，可以将数值直接作为 where 方法的第二个参数：

```c
user = DB->table("users")->where("name", "mudren")->get();
```

当然，你也可以使用其他的运算符来编写 `where` 子句：

```c
users = DB->table("users")
                ->where("id", ">=", 100)
                ->get();

users = DB->table("users")
                ->where("id", "<>", 100)
                ->get();

users = DB->table("users")
                ->where("email", "like", "%@mud.ren")
                ->get();
```

你还可以传递条件数组到 where 函数中实现 `AND` 查询：

```c
// 相当于 WHERE user_id>7 AND category_id=4
res = DB->table("topics")->where(({ ({"user_id", ">", 7}), ({"category_id", 4}) }))->get();
```

你也可以对 `where` 函数链式调用，以上查询可以使用以下方式：
```c
// 相当于 WHERE user_id>7 AND category_id=4
res = DB->table("topics")->where("user_id", ">", 7)->where("category_id", 4)->get();
```

#### orWhere 语句
你可以一起链式调用 `where` 约束，也可以在查询中添加 or 字句。 `orWhere` 方法和 `where` 方法接收的参数一样：

```c
// 相当于 WHERE user_id>7 OR category_id=4
res = DB->table("topics")->where("user_id", ">", 7)->orWhere("category_id", 4)->get();
```

请注意：`orWhere`方法之前必须至少有一次`where`调用，否则报错。

### 附加 Where 语句

除了基础的 `where` 和 `orWhere`，还有以下语句可用：

#### whereBetween / orWhereBetween / whereNotBetween / orWhereNotBetween

验证字段值是否在给定的两个值之间或之外：

```c
users = DB->table("users")
           ->whereBetween("votes", ({1, 100}))
           ->get();
```

#### whereIn / whereNotIn / orWhereIn / orWhereNotIn

验证字段值是否在给定的数组中：

```c
users = DB->table("users")
           ->whereIn("id", ({1, 3, 5, 7, 9}))
           ->get();
```

#### whereNull / orWhereNull / whereNotNull / orWhereNotNull

验证指定的字段是否是 `NULL`：

```c
users = DB->table("users")
           ->whereNull("updated_at")
           ->get();
```

### Distinct, Ordering, Grouping, Limit & Offset

#### distinct

`distinct` 方法会强制让查询返回的结果不重复：

```c
users = DB->table("users")
                ->distinct()
                ->get("name");
```

#### orderBy

`orderBy` 方法允许你通过给定字段对结果集进行排序。 `orderBy` 的第一个参数应该是你希望排序的字段，第二个参数控制排序的方向，可以是 `asc` 或 `desc`：

```c
users = DB->table("users")
                ->orderBy("name", "desc")
                ->get();
```

如果你需要使用多个字段进行排序，你可以多次引用 `orderBy`：

```c
users = DB->table("users")
                ->orderBy("name", "desc")
                ->orderBy("email", "asc")
                ->get();
```

#### inRandomOrder

`inRandomOrder` 方法被用来将结果进行随机排序。例如，你可以使用此方法随机找到一个用户：

```c
randomUser = DB->table("users")
                ->inRandomOrder()
                ->first();
```

#### limit / offset

要限制结果的返回数量，或跳过指定数量的结果，你可以使用 `limit` 和 `offset` 方法：

```c
users = DB->table("users")
                ->offset(10)
                ->limit(5)
                ->get();
```

----

## 插入

查询构造器还提供了 `insert` 方法用于插入记录到数据库中。 `insert` 方法接收映射形式的字段名和字段值进行插入操作：

```c
DB->table("users")->insert((["name":"test", "email":"test@mud.ren"]));
```

## 更新

查询构造器也可以通过 `update` 方法更新已有的记录。 `update` 方法和 `insert` 方法一样，接受包含要更新的字段及值的映射。你可以通过 `where` 子句对 `update` 查询进行约束：

```c
DB->table("users")->where("id", ">", 120)->limit(5)->update((["level":777]));
```

## 删除

查询构造器也可以使用 `delete` 方法从表中删除记录。 在使用 `delete` 前，可以添加 `where` 子句来约束 `delete` 语法：

```c
DB->table("migrations")->where("id",">", 55)->limit(5)->delete();
```

----

## 原生语句

除了使用封装好的方法外，查询构造器还提供了原生SQL语句的使用，通过使用 `sql` 方法执行，注意对 `SELECT` 语句可以使用 `get`、`first`、`pluck`、`value`方法获取查询结果，而 `INSERT`、`UPDATE`、`DELETE` 语句使用 `exec` 执行。

```c
// 查询
res = DB->sql("select * from users")->get();
res = DB->sql("select * from users")->pluck("name");
res = DB->sql("select * from users where name='mudren'")->value("email");
// 删除
res = DB->sql("delete from users where id>130 limit 5")->exec();
```

----

## 长连接

需要注意的是，`CORE_DB` 默认使用的是短连接，所有数据库操作完成后自动释放 db_handle ，如果是大量重复查询，最好改为长连接，并自己在必要时操作释放 db_handle 。

如需长连接，请使用 `setAutoClose(0)` 方法禁用自动释放，并在执行结束时调用 `close(1)` 方法释放 db_handle

```c
void test()
{
    // 初始化数据库连接
    object DB = new(CORE_DB, host, db, user);
    // 禁用自动关闭连接
    DB->setAutoClose(0);

    // ...数据库操作

    // 关闭数据库连接
    DB->close(1);
}
```

## 调试

在绑定查询的时候，您可以使用 `dump` 方法来输出最近一次查询SQL：

```c
printf(DB->dump());
```

调试输出结果类似以下：

    -*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*-
    db_host = 127.0.0.1
    db_db = mud
    db_user = root
    db_handle = 1
    db_error = 0
    db_table = topics
    db_table_column = ({ /* sizeof() == 2 */
    "user_id",
    "title"
    })
    db_sql = SELECT user_id,title FROM topics WHERE user_id > '7' AND category_id='4'
    -*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*-

----

如果你只是简单查询，可以通过继承`CORE_DB`的方式，而不需要用 `new()` 方法生成数据库连接对象，示例如下：

```c
inherit CORE_DB;

void test()
{
    mixed res;

    /**
     * @brief 配置数据库连接
     *
     */
     mapping db = ([
     	"host":"127.0.0.1",
        "database":"mud",
        "user":"root"
     ]);
    DB::setConnection(db);

    // 获取 users 表的所有结果
    res = DB::table("users")->get();
    printf("%O", res);
}
```

----

## Introduction

The database query builder provides a convenient, fluent interface to creating and running database queries. It can be used to perform most database operations in your mud and works perfectly with all of fluffos supported database systems.

## Config

You can inherit `/std/database.c` and set config with `setConnection()`, for example:

```c
inherit "/std/database";

void test()
{
    mixed res;
    // use SQLITE3
    mapping db = ([
        "host":"",
        "database":"/data/db.sqlite",
        "user":"",
        "type":__USE_SQLITE3__
    ]);
    database::setConnection(db);
    // database queries
    printf("%O\n", database::table("users")->get());
}
```

The database type can be `__USE_MYSQL__`、`__USE_SQLITE3__`、`__USE_POSTGRE__` or `__DEFAULT_DB__`。

Or, clone database object like this:

```c
void test()
{
    object db = new("/std/database", "", "/sqlite.db", "", __USE_SQLITE3__);
    printf("%O\n", db->table("users")->get());
}
```

## Running Database Queries

### Retrieving All Rows From A Table

You may use the `table` method provided by the `/std/database.c` to begin a query. The `table` method returns a fluent query builder instance for the given table, allowing you to chain more constraints onto the query and then finally retrieve the results of the query using the `get` method:

```c
void test()
{
    object db = new("/std/database", "", "/sqlite.db", "", __USE_SQLITE3__);
    // Retrieving all rows from users table
    printf("%O\n", db->table("users")->get());
}
```

The `get` method return a 2D array.

### Retrieving A Single Row / Column From A Table

If you just need to retrieve a single row from a database table, you may use the `first` method. This method will return an array:

```c
    printf("%O\n", db->table("users")->first());
```

If you don't need an entire row, you may extract a single value from a record using the `value` method. This method will return the value of the column directly:

```c
    printf("%s\n", db->table("users")->where("name", "mudren")->value("email"));
```

To retrieve a single row by its id column value, use the `find` method:


```c
    printf("%O\n", db->table("users")->find(3));
```

### Retrieving A List Of Column Values

If you would like to retrieve result containing the values of a single column, you may use the `pluck` method. In this example, we'll retrieve an array of user names:

```c
    printf("%O\n", db->table("users")->pluck("name"));
```

### Aggregates

The query builder also provides a variety of methods for retrieving aggregate values like `count`, `max`, `min`, `avg`, and `sum`. You may call any of these methods after constructing your query:

```c
    printf("user_count = %d\n", db->table("users")->count());
    printf("max_age = %d\n", db->table("users")->max("age"));
```

Of course, you may combine these methods with other clauses to fine-tune how your aggregate value is calculated:

```c
    printf("count = %d\n", db->table("users")->where("age", 14)->count());
```

## Raw Expressions

Sometimes you may need to insert an arbitrary string into a query. To create a raw string expression, you may use the `sql` and `exec` method：

```c
    object db = new("/std/database", "", "/sqlite.db", "", __USE_SQLITE3__);
    mixed res;
    db->sql("DROP TABLE IF EXISTS `users`")->exec();
    res = db->sql("CREATE TABLE IF NOT EXISTS `users` (`id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`name` varchar(25) NOT NULL,`bio` TEXT(255) DEFAULT NULL,`activated_at` timestamp DEFAULT NULL)")->exec();
```

## Basic Where Clauses

### Where Clauses

You may use the query builder's `where` method to add "where" clauses to the query. The most basic call to the `where` method requires three arguments. The first argument is the name of the column. The second argument is an operator, which can be any of the database's supported operators. The third argument is the value to compare against the column's value.

For example, the following query retrieves users where the value of the `exp` column is equal to `100` and the value of the `age` column is greater than `15`:

```c
res = database::table("users")
            ->where("exp", "=", 100)
            ->where("age", ">", 15)
            ->get();
```

For convenience, if you want to verify that a column is `=` to a given value, you may pass the value as the second argument to the `where` method. database will assume you would like to use the `=` operator:

```c
    res = database::table("users")->where("age", 16)->get();
```

As previously mentioned, you may use any operator that is supported by your database system:

```c
users = database::table("users")
                ->where("id", ">=", 100)
                ->get();

users = database::table("users")
                ->where("id", "<>", 100)
                ->get();

users = database::table("users")
                ->where("email", "like", "%@mud.ren")
                ->get();
```

You may also pass an array of conditions to the `where` function. Each element of the array should be an array containing the three arguments typically passed to the where method:

```c
// WHERE user_id > 7 AND category_id = 4
res = db->table("topics")->where(({ ({"user_id", ">", 7}), ({"category_id", 4}) }))->get();
```

### Or Where Clauses

When chaining together calls to the query builder's `where` method, the "where" clauses will be joined together using the `and` operator. However, you may use the `orWhere` method to join a clause to the query using the `or` operator. The `orWhere` method accepts the same arguments as the `where` method:

```c
// WHERE user_id > 7 OR category_id = 4
res = db->table("topics")->where("user_id", ">", 7)->orWhere("category_id", 4)->get();
```

### Additional Where Clauses

#### whereBetween / orWhereBetween

The `whereBetween` method verifies that a column's value is between two values:

```c
users = db->table("users")->whereBetween("age", ({14, 18}))->get();
```


#### whereNotBetween / orWhereNotBetween

The `whereNotBetween` method verifies that a column's value lies outside of two values:

```c
users = db->table("users")->whereNotBetween("age", ({14, 18}))->get();
```

#### whereIn / whereNotIn / orWhereIn / orWhereNotIn

The `whereIn` method verifies that a given column's value is contained within the given array. The `whereNotIn` method verifies that the given column's value is not contained in the given array.

```c
users = db->table("users")->whereIn("age", ({14, 18, 24, 30}))->get();
```

#### whereNull / orWhereNull / whereNotNull / orWhereNotNull

The `whereNull` method verifies that the value of the given column is `NULL`, The `whereNotNull` method verifies that the column's value is not `NULL`:

```c
users = db->table("users")->whereNull("updated_at")->get();
```

## Ordering, Grouping, Limit & Offset

### Ordering

The `orderBy` method allows you to sort the results of the query by a given column. The first argument accepted by the `orderBy` method should be the column you wish to sort by, while the second argument determines the direction of the sort and may be either `asc` or `desc`:

```c
users = db->table("users")
            ->orderBy("name", "desc")
            ->get();
```

To sort by multiple columns, you may simply invoke `orderBy` as many times as necessary:

```c
users = db->table("users")
            ->orderBy("name", "desc")
            ->orderBy("email", "asc")
            ->get();
```

### Random Ordering

The `inRandomOrder` method may be used to sort the query results randomly. For example, you may use this method to fetch a random user:

```c
randomUser = DB->table("users")
                ->inRandomOrder()
                ->get();
```

### Limit & Offset

You may use the `limit` and `offset` methods to limit the number of results returned from the query or to skip a given number of results in the query:

```c
users = db->table("users")
            ->offset(10)
            ->limit(5)
            ->get();
```

## Insert Statements

The query builder also provides an `insert` method that may be used to insert records into the database table. The `insert` method accepts an mapping of column names and values:

```c
db->table("users")->insert((["name":"test", "email":"test@mud.ren"]));
```

## Update Statements

In addition to inserting records into the database, the query builder can also update existing records using the `update` method. The `update` method, like the insert method, accepts an mapping of column and value pairs indicating the columns to be updated. You may constrain the update query using where clauses:

```c
db->table("users")->where("id", ">", 120)->limit(5)->update((["level":99]));
```

## Delete Statements

The query builder's `delete` method may be used to delete records from the table. You may constrain delete statements by adding "where" clauses before calling the `delete` method:

```c
db->table("users")->delete();
db->table("users")->where("id",">", 5)->limit(5)->delete();
```

## Auto Close

By default, database will auto close connection and release db_handle, you can use `setAutoClose(0)` disable this and close the database connection with `close(1)`：

```c
void test()
{
    object DB = new(CORE_DB, host, db, user);
    // close auto close
    DB->setAutoClose(0);

    // ...sql

    // close
    DB->close(1);
}
```

## Debugging

You may use the `dump` methods while building a query to dump the current query bindings and SQL.

```c
printf(db->dump());
```

    -*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*-
    db_host = 127.0.0.1
    db_db = mud
    db_user = root
    db_handle = 1
    db_error = 0
    db_table = topics
    db_table_column = ({ /* sizeof() == 2 */
    "user_id",
    "title"
    })
    db_sql = SELECT user_id,title FROM topics WHERE user_id > '7' AND category_id='4'
    -*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*-
