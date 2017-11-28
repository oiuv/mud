//Room: xiaojia-pianting.c

inherit ROOM;

void create ()
{
        set ("short", "偏厅");
        set ("long", @LONG
这里是萧家的偏厅，摆设很是华丽。几个丫鬟忙个不停，似乎出了
什么大事。
LONG);
        set("exits", ([
        	"south" : __DIR__"xiaojiadt",
        ]));

        set("objects", ([
        	__DIR__"npc/yahuan" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
