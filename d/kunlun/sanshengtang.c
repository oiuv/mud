inherit ROOM;

void create()
{
        set("short", "三圣堂");
        set("long", @long
昆仑山三圣堂乃“昆仑三圣”何足道所建，原为了修身养
性，读书练功。随着昆仑派日益壮大，名声远播，这里便成了
昆仑派聚众议事，接待各路江湖英雄的地方。「昆仑三圣」也
只好另觅安静所在了。
long);
        set("exits",([
                "west" : __DIR__"jiuqulang1",
                "northdown" : __DIR__"lang2",
                "north" : __DIR__"liangong",
                "northwest" : __DIR__"jiuqulang2",
        ]));

        set("objects",([
                CLASS_D("kunlun") + "/banshuxian" : 1,
        ]));

        set("valid_startroom", 1);
        setup();
        "/clone/board/kunlun_b"->foo();
}

int valid_leave(object me, string dir)
{
        object ban;

        if (dir != "north" ||
            ! objectp(ban = present("ban shuxian", this_object())))
                return ::valid_leave(me, dir);

        return ban->permit_pass(me, dir);
}

