// liangonge.c 练功房

inherit ROOM;

void create()
{
        set("short", "东练功房");
        set("long", @LONG
这里是东面的练功房，屋中立着一些练武者常用的木人。
LONG );
        set("exits", ([
                "west" : __DIR__"liangong",
        ]));
        set("for_family", "关外胡家");
        setup();
	replace_program(ROOM);
}
