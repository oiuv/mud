inherit ROOM;

void create()
{
        set("short", "小院");
        set("long", @LONG
你一脚踏进来，不由得喊了声好，只见修篁一片，间中是
两棵佛祖曾在其下悟道的菩提树。小路沿着修竹而弯，北面路
的尽头就是方丈大师傅的住所，也是他平常接待贵客的地方。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"north" : __DIR__"fangzhang",
  		"west" : __DIR__"cangjing",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
