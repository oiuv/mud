inherit ROOM;

void create()
{
	set("short", "南大街");
	set("long", @LONG
南大街乃是城里的繁华地段，一到晚上，一派灯红酒绿，
尤为热闹。笑声、歌声、琴声、箫声，汇成一片送入了你的耳
朵，你不禁心猿意马，很想就此停步享受一番。苏州的城里秀
丽景色此时已使你心旷神怡，此时此刻只想与这大自然秀丽的
景色融为一体。从这里看去，苏州南城的街景是一片喧闹。在
街的东北面是一个茶馆，正东望去是一座苏州园林。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"east"      : __DIR__"shizilin",
		"west"      : __DIR__"jubaozhai",
		"north"     : __DIR__"baodaiqiao",
		"south"     : __DIR__"nandajie3",
	]));
	setup();
	replace_program(ROOM);
}

