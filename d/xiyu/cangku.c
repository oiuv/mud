inherit ROOM;

void create() {
    object ob;
    set("short", "溶洞");
    set("long", @LONG
这里原来是一个长在山壁上的天然溶洞，因为地点隐密而
且洞中十分干燥，星宿派把这里改造成了一个仓库。
LONG);
    set("exits", ([
        "out": __DIR__ "xxroad5",
    ]));
    set("objects", ([
        "/d/items/liquid/qing_hulu": 2,
        __DIR__ "obj/menghan_yao": 1 + random(2),
        __DIR__ "obj/xxqingxin-san": 1,
        "/d/items/hands/jinsi_shoutao": 1 + random(2),
        "/clone/misc/muding": 2 + random(2),
        "/clone/book/dujing_1": random(2),

    ]));
    set("outdoors", "xingxiu");

    ob = new("/clone/misc/xiangliao");
    ob->set_amount(200 + random(100));
    ob->move(this_object());

    setup();
    replace_program(ROOM);
}
