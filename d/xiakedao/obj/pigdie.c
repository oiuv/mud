// pigdie.c

inherit ITEM;
inherit F_CUTABLE;

void create()
{
        set_name("死猪", ({ "pig", "pigdie" }));
        set_weight(50000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("parts", ([
                        "zhutou" : ({ 0, "个", "猪头", "猪头", "zhutou",
                                      0, "剁下", __DIR__"zhutou" }),
                        "forleg" : ({ 0, "对", "前腿", "前腿", "forleg",
                                      0, "剁下", __DIR__"forleg" }),
                        "backleg": ({ 0, "对", "后腿", "后腿", "backleg",
                                      0, "剁下", __DIR__"backleg" }),
                ]));
                set("long", "这是一只死去的野猪，长得颇为粗壮，看来可以割点肉尝尝。\n");
                set("unit", "只");
                set("value", 1000);
        };

        setup();
}

string long() { return ::long() + extra_desc(); }
