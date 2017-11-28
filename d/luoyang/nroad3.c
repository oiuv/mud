inherit ROOM;

void create()
{
	set("short", "淳熙路");
	set("long", @LONG
淳熙大路是洛阳最整洁的一条大路，街道宽敞而干净，汉白玉砌的路
面被雨水冲得光明如镜，大路两侧的瓦房高大而宏伟，分明便是巨富宅院。
双人合抱的杨树十步一株，整齐的排在两边。东边是举子秀才常去之地文
庙，而西边则是科考试场 。
LONG);
        set("outdoors", "luoyang");
	set("no_clean_up", 0);
	set("exits", ([
  		"east" : __DIR__"wenmiao",
  		"north" : __DIR__"nroad4",
  		"west" : __DIR__"kaoshi",
  		"south" : __DIR__"nroad2",
	]));
        set("objects", ([
                "/d/beijing/npc/shusheng2" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
