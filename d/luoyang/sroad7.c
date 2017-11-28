inherit ROOM;

void create()
{
	set("short", "景云道");
	set("long", @LONG
景云大道位于洛阳城里的南面，是洛阳最繁华地段，青石板铺成的街
面，宽阔而整洁，一到晚上，一派灯红酒绿，尤为热闹。笑声、歌声、琴
声、箫声，汇成一片送入了你的耳朵，你不禁心猿意马，很想就此停步享
受一番。再往南就要到南内城门了，远远望去，可以看见守城的官兵正在
检查排队出城的路人。这里的东边是一间花店，在里面你可以买到名满天
下的洛阳牡丹，西边是鲁氏木器店。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"miaopu",
  		"north" : __DIR__"sroad6",
  		"south" : __DIR__"nandoor",
  		"west" : __DIR__"muqipu",
	]));

	setup();
	replace_program(ROOM);
}
