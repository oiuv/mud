inherit ROOM;

void create()
{
        set("short", "废园");
	set("long", @LONG
你看到四周芳草萋萋，这里是一座废弃了多年的园子，到
处都是老鼠和灰尘，使人不由得黯然神伤。
LONG);
        set("outdoors", "jingzhou");
        set("exits", ([
	  	"south" : __DIR__"dongdajie2",
	]));
        set("objects", ([
                "/d/kaifeng/npc/qigai" : 1,
        ]));
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
 
