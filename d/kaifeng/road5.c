inherit ROOM;

void create()
{
        set("short", "御街");
        set("long", @LONG
御街是横贯开封的主要街道，也是皇上出巡的要道。街道
两边店铺亭台不断，小贩叫卖，行人来往，车马喧哗，一派繁
华，南边的高桥就是州桥，西面是龙亭寺。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"southup" : __DIR__"road4",
  		"north" : __DIR__"road6",
  		"west" : __DIR__"longting",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
