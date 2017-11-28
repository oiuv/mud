inherit ROOM;

void create()
{
        set("short", "石拱门");
        set("long", @LONG
用石头搭起来的一个拱门，高越两丈，上面镂刻云纹。两
边是拴马的石柱。再往前边一点的地方，有块旗杆石，那是由
两块巨大的石头，一半埋到地下，在和口的地方，有个大孔可
以插旗杆。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"southup" : __DIR__"8bao",
  		"northdown" : __DIR__"road",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
