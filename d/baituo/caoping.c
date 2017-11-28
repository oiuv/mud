inherit ROOM;

void create()
{
        set("short","草坪");
        set("long", @LONG
这里是一块芳草坪，绿草茵茵，蝴蝶漫舞，让人感到惬意。
不过偶尔也会碰到菜花蛇。
LONG);
        set("exits", ([
                "west" : __DIR__"shijie",
        ]));

        set("objects" , ([
                "/clone/beast/caihuashe" : random(2),
        ]));

        set("quarrys", ([
                "caihuashe"  : 100000,
                "dushe"      : 20000,
                "jinshe"     : 20000,
                "qingshe"    : 20000,
        ]));

        set("outdoors", "baituo");
        setup();
        replace_program(ROOM);
}
