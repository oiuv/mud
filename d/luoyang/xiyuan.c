inherit ROOM;

void create()
{
	set("short", "京韵大戏院");
	set("long", @LONG
戏院内有一座高高的戏台，台上一些脸上上过妆的人，穿着戏服，拿
着道具，正手舞足蹈，咿咿呀呀的唱着中国的国粹京剧，台下有好几排椅
子，坐满了戏迷，票友，正兴致勃勃的看着台上的表演，听到妙处，会忍
不住站起来，大叫一声“好”！
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"east" : __DIR__"houtai",
  		"west" : __DIR__"sroad4",
	]));
        set("objects", ([
                "/d/beijing/npc/guanzhong" : 4,
                "/d/beijing/npc/xizi2" : 1,
                "/d/beijing/npc/xizi3" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
