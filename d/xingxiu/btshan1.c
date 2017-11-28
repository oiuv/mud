inherit ROOM;

void create()
{
        set("short", "白驼山庄");
        set("long", @LONG
这里是「西毒」欧阳锋练功的地方，屋内什么摆设也没有。
LONG);
        set("exits", ([ 
            	"eastdown" : __DIR__"btshan",
        ]));
        set("objects", ([
            	"/clone/beast/qingshe" : 2,
        ]));

        set("no_clean_up", 0);
        set("outdoors", "xingxiu");

        setup();
        replace_program(ROOM);
}
