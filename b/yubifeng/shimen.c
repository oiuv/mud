// /guanwai/shimen.c

inherit ROOM;

void create()
{
        set("short", "洞窟内");
        set("long", @long
洞中到处是千年不化的尖冰，有些处所的冰条如刀剑般锋锐突出。行不多时
前面已无去路，只见一块圆形巨岩叠在另一块圆岩上，两块巨岩封住了去路。
两岩之间都是坚冰凝结。
long );
//火烧会出现门
//　　眼见二岩之间的坚冰已融去大半，宝树性急，双手在巨岩上运力一推，那岩
//石毫不动弹，再烧一阵，坚冰融去更多，宝树第二次再推时，那巨岩幌了几幌，
//竟慢慢转将过去，露出一道空隙，宛似个天造地设的石门一般。
        set("exits", ([
                "west"    : __DIR__"tongdao",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
