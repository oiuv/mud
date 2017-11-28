inherit ROOM;

void create()
{
	set("short", "景云道");
	set("long", @LONG
景云大道位于洛阳城里的南面，是洛阳最繁华地段，青石板铺成的街
面，宽阔而整洁，一到晚上，一派灯红酒绿，尤为热闹。笑声、歌声、琴
声、箫声，汇成一片送入了你的耳朵，你不禁心猿意马，很想就此停步享
受一番。东边是有钱人享受的地方-洪德浴池，而西边则是赌徒们的乐土-
长乐坊。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"yuchi",
  		"south" : __DIR__"sroad4",
  		"north" : __DIR__"sroad2",
  		"west" : __DIR__"duchang",
	]));
        set("objects", ([
                "/d/beijing/npc/haoke1" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
