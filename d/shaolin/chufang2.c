inherit ROOM;

void create()
{
	set("short", "厨房");
	set("long", @LONG
这里是一间厨房。厨房很大，可能也是因为兼作仓库的缘
故。灶头砌在北首，一根大烟囱直通出屋顶。房子四壁被常年
烟火熏得发黑，连房梁也是焦黑焦黑。墙角堆满了柴火，另一
边放了些晒干的辣椒，稻谷等。东边的墙灰剥落了一块，露出
犬牙交错的砖缝来。屋角边有个大洞。
LONG);
	set("exits", ([
		"southwest" : __DIR__"houshan",
        ]));
        setup();
        replace_program(ROOM);
}
