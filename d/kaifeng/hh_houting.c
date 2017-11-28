inherit ROOM;

void create()
{
        set("short", "后厅");
        set("long", @LONG
这里是红花会总舵内的后厅，大厅相当的宽敞明亮，四周
的墙上悬挂满了各朝名人的真迹。只见一人座立中堂，躯体肥
胖，便宛如富贵商贾一般，笑容和蔼，很是慈祥。旁边站着几
个红花会的会众，胸前佩着一朵大红花，神情严肃。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"hh_zoulang6",
  		"east" : __DIR__"hh_zoulang7",
  		"north" : __DIR__"hh_zoulang8",
  		"south" : __DIR__"hh_zhengting",
	]));
        set("objects", ([
                CLASS_D("honghua") + "/zhao" : 1,
                __DIR__"npc/honghua2" : 2,
        ]));
        setup();
        replace_program(ROOM);
}
