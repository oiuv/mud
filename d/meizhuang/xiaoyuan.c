inherit ROOM;

void create()
{
        set("short", "琴心小院");
        set("long", @LONG
穿过月洞门，便是一座看起来非常普通的小小的院落，两旁修竹
姗姗，花径鹅卵石上生满青苔，显得平素少有人行。花径通到三间石
屋之前。屋前屋后七八株苍松夭矫高挺，遮得四下里阴沉沉的。
LONG
        );
        set("exits", ([
                "south" : __DIR__"yuedong",
                "enter" : __DIR__"xiaowu",
        ]));

        set("objects", ([
                __DIR__"npc/shi" : 1,
        ]));

        set("outdoors", "meizhuang");

        setup();
}

int valid_leave(object me, string dir)
{
        object shi;

        if (dir != "enter" ||
            ! objectp(shi = present("shi lingwei", this_object())))
                return ::valid_leave(me, dir);

        return shi->permit_pass(me, dir);
}
