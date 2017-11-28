inherit ROOM;

void create()
{
        set("short", "青石道" );
        set("long", @LONG
接近荆州，路由黄土变成了青石铺路，两旁渐渐可以看见
一些农舍，农田肥沃，稻香四飘。古称荆州为军事要地，地理
为其一，肥沃为其二啊！往西望去，可见荆州的城楼了。
LONG);
        set("outdoors", "jingzhou");
        set("exits", ([
  		"east" : __DIR__"guandao2",
  		"west" : __DIR__"jzdongmen",
	]));
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

