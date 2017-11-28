inherit ROOM;

void create()
{
	set("short", "景云道");
	set("long", @LONG
景云大道位于洛阳城里的南面，是洛阳最繁华地段，青石板铺成的街
面，宽阔而整洁，一到晚上，一派灯红酒绿，尤为热闹。笑声、歌声、琴
声、箫声，汇成一片送入了你的耳朵，你不禁心猿意马，很想就此停步享
受一番。东边是一家杂货铺，提供人们日常生活所需的一些用品，西边是
一个大戏院，供人消遣时间所用，不时的从戏院里传出阵阵叫好的声音。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"xiyuan",
  		"south" : __DIR__"sroad5",
  		"north" : __DIR__"sroad3",
  		"west" : __DIR__"zahuopu",
	]));

	setup();
	replace_program(ROOM);
}
