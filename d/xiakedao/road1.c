// /d/xiakedao/road1.c 侠客岛 山路1

inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
走在青石铺成的小路上，脚步十分轻捷。两旁都是密林，枝叶遮
天蔽日，阴沉沉的很不舒服。林中鸟雀叽喳，与呼呼的风声混成一片。
LONG );
        set("outdoors", "xiakedao");
        set("exits", ([
                "southup" : __DIR__"road2",
                "northdown" :__DIR__"shanmen",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
