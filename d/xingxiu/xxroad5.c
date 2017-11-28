inherit ROOM;

void create()
{
        set("short", "小路");
        set("long", @LONG
山势在这里渐渐变得平缓，你已经可以听见西边山涧底的
水声。东面有一个山洞。
LONG);
        set("exits", ([
            	"south" : __DIR__"xxroad4",
            	"enter" : __DIR__"cangku",
            	"north" : __DIR__"xxroad6",
        ]));
        set("objects", ([
            	CLASS_D("xingxiu") + "/chuchen" : 1,
        ]));
        set("outdoors", "xingxiu");
        setup();
}

int valid_leave(object me, string dir)
{
        object guarder;

        if (! objectp(guarder = present("chuchen zi", this_object())))
                return 1;

        if (dir == "enter" || 
            (dir == "enter" &&! userp(me)))
                return guarder->permit_pass(me, dir);

        return 1;
}

