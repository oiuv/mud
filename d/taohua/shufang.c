inherit ROOM;

void create()
{
        set("short", "书房");
        set("long", @LONG
这是一间干干净净的书房。当中一个大檀木桌，桌上放着
不少书籍。靠墙的地方还有一个书架，架上满满的全是各种封
装的书。其中不少书看上去古意盎然，显然年代已久。
LONG);
        set("exits", ([
                "down" : __DIR__"daojufang",
        ]));
        set("objects", ([
                "/clone/book/yijing" + random(4) : 1,
                "/clone/book/yijing" + random(4) : 1,
                "/clone/book/jiuzhang" : 1,
                CLASS_D("taohua") + "/qu": 1,
        ]) );
        setup();
        replace_program(ROOM);
}
