//Room: huanggong.c

inherit ROOM;

void create ()
{
        set ("short", "皇宫大殿");
        set ("long", @LONG
皇宫大殿坐落全宫核心，左右是两个偏殿，各有一条约二十丈长的
廊道相连，如两边飞出雁翼。两个副殿，以左翼殿和右翼殿为名。
LONG);
        set("exits", ([
        	"south"   : __DIR__"bridge2",
        	"north"   : __DIR__"bridge1",
        	"east"   : __DIR__"fudian1",
        	"west"   : __DIR__"fudian2",
        ]));
        set("objects", ([
        	__DIR__"npc/shiwei" : 4,
        ]));

        setup();
        replace_program(ROOM);
}
