inherit ROOM;

void create()
{
	set("short", "千人石");
	set("long", @LONG
在虎丘山中心，有一块千人石，巨石呈暗紫红色，由南向
北倾斜石面甚平坦，石壁如斧削。传说吴王墓筑成后，其子夫
差怕泄露筑墓秘密假借墓成祝酒观舞之名，将千余名工匠全部
杀戮，鲜血渗透石中，成暗红色。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"east"  : __DIR__"erxianting",
		"north" : __DIR__"zhishuang",
	]));
	setup();
	replace_program(ROOM);
}

