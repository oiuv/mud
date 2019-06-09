inherit ROOM;

private void create()
{
    set("short", "无限迷宫");
    set("long", "这里有一个闪闪发光的传送门，好像可以离开迷宫。\n");
    set("exits", ([
        "enter" : "/d/city/guangchang",
        "east" : __DIR__ "10,9,0",
        "south" : __DIR__ "9,8,0",
        "west" : __DIR__ "8,9,0",
        "north" : __DIR__ "9,10,0",
    ]));
    set("maze", "maze");
    set("outdoors", "maze");
}
