inherit ROOM;

void create()
{
        set("short", "前厅");
        set("long", @LONG
这里是红花会总舵内的前厅，大厅相当的宽敞明亮，四周
的墙上悬挂满了各朝名人的真迹。厅中站着几个红花会的会众
赤裸着上身，胸前佩着一朵大红花，神情严肃。大厅往北是条
走廊，那是通往正厅所在。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"hh_zoulang2",
  		"east" : __DIR__"hh_zoulang3",
  		"north" : __DIR__"hh_zhengting",
  		"south" : __DIR__"hh_zoulang1",
	]));
        set("objects", ([
                __DIR__"npc/honghua1" : 4,
        ]));
        setup();
        replace_program(ROOM);
}
