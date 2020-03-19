inherit ROOM;

void create()
{
        set("short", "冰道");
        set("long", @LONG
这条冰道的两边都很安静。西边是冰车，东边是凌霄城的监
狱。北边过去，就是凌霄城的根本之地----雪山派的总堂凌霄殿
了，这里防守紧密，四处都是凌霄弟子。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            	"south" : __DIR__"iceroad2",
            	"north" : __DIR__"meiroad1",
            	"west"  : __DIR__"car",
            	"east"  : __DIR__"jianyuting",
        ]));
        set("objects", ([
                __DIR__"npc/dizi" : 2,
        ]));
        setup();
        replace_program(ROOM);
}

