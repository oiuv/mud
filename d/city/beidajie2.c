inherit ROOM;

void create()
{
	set("short", "北大街");
        set("long", @LONG
这是一条宽阔的青石街道，向南北两头延伸。北边则是由
北城门通向城外。街道南边显得很繁忙。东边是一座两层的大
楼阁，挂着「太白遗风」的招帘，门额上悬挂一方横匾「醉仙
楼」三字擦得闪闪发亮，乃是苏学士的手笔。阵阵酒肉香酒香
让你垂涎欲滴。西边是一座古朴的庙宇，香火缭绕，那就是天
下学武之人所共同敬仰的武庙了。
LONG );
        set("outdoors", "city");
	set("exits", ([
		"east"  : __DIR__"zuixianlou",
		"south" : __DIR__"beidajie1",
		"west"  : __DIR__"wumiao",
		"north" : __DIR__"beimen",
	]));
	setup();
	replace_program(ROOM);
}

