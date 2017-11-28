inherit ROOM;

void create()
{
        set("short", "小径");
        set("long", @LONG
你走在一条石板铺成的小路上，两旁是高大的垂柳，虽在
骄阳似火的夏日，依旧凉爽怡人。因为这里是总舵主及各位当
家的常来之地，所以路也修砌的很好。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"hh_penquan",
  		"north" : __DIR__"hh_woshi",
	]));
        set("outdoors", "honghua");
        setup();
        replace_program(ROOM);
}
