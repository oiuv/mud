//Room: xiaojia-sleep.c

inherit ROOM;

void create ()
{
        set ("short", "卧室");
        set ("long", @LONG
这里是萧家的卧室，摆设很是华丽。几个丫鬟忙个不停，似乎出了
什么大事。
LONG);
        set("exits", ([
        	"north" : __DIR__"xiaojiadt",
        ]));
        set("objects", ([
        	__DIR__"npc/yahuan" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
