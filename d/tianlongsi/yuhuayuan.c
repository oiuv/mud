inherit ROOM;

void create()
{
        set("short", "雨花院");
        set("long",@LONG
相传当年佛祖降临天龙寺传法时，漫天遍洒雨花石。后人以石建
院，即成此间玉花院。院中常年檀香四溢，令人心旷神怡。
LONG );
        set("exits", ([
                "west" : __DIR__"wuwujing",
		"south" : __DIR__"doumugong",
	]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
