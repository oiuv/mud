inherit ROOM;

private void create()
{
    set("short", "心魔幻境");
    set("long", "这里有一个闪闪发光的传送门，好像可以离开幻境。\n");
    set("exits", ([
        "enter" : "/d/city/guangchang",
        "east" : __DIR__ "10,9,9",
        "south" : __DIR__ "9,8,9",
        "west" : __DIR__ "8,9,9",
        "north" : __DIR__ "9,10,9",
    ]));
    set("maze", "maze");
    set("outdoors", "maze");
}
