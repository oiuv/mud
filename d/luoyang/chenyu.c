inherit ROOM;

void create()
{
	set("short", "沉鱼阁");
	set("long", @LONG
应入眼帘，首先是一幅占据了一面墙的春宫图，无疑为名家所著。画
法细腻，毫发尽现。金盏玉杯，红烛粉黛构成了一种奇特的胁调。厅正中
放着几张玉石圆桌，桌上杯盏参差。此阁无顶。每当深夜，微风袭袭，繁
星点点；一轮明月，悬挂于正央。放眼眺望，洛阳城尽收眼底。苍穹暗淡，
唯阁烛一盏；万物尽淡，唯英雄美人。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"west" : __DIR__"jiyuan2",
	]));

	setup();
	replace_program(ROOM);
}
