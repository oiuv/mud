inherit ROOM;

void create()
{
        set("short", "冷杉林");
        set("long", @LONG
这是片遮天蔽日的冷杉林。数人也合抱不过来的冷杉树簇
在一块，枝繁叶茂，象一蓬蓬巨伞般伸向天空，把阳光遮得丝
毫也无。看地上厚厚的枯枝烂叶，显然游客很少踏足此处。
LONG);
        set("exits", ([
                "southwest" : __DIR__"bashisipan3",
                "northdown" : __DIR__"lengsl3",
                "southeast" : __DIR__"jieyindian",
        ]));
        set("objects", ([
                CLASS_D("misc") + "/houwang" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
