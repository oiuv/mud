inherit ROOM;

void create()
{
	set("short", "景云道");
	set("long", @LONG
景云大道位于洛阳城里的南面，是洛阳最繁华地段，青石板铺成的街
面，宽阔而整洁，一到晚上，一派灯红酒绿，尤为热闹。笑声、歌声、琴
声、箫声，汇成一片送入了你的耳朵，你不禁心猿意马，很想就此停步享
受一番。东边是一家首饰店，里面摆满了金银珠宝，西边的水果店，常年
有新鲜水果供应。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"shoushi",
  		"south" : __DIR__"sroad7",
  		"west" : __DIR__"shuiguo",
  		"north" : __DIR__"sroad5",
	]));

	setup();
	replace_program(ROOM);
}
