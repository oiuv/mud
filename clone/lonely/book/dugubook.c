#include <ansi.h>; 
inherit ITEM;
// 独孤九剑之无招解迷物件
// Edit by Rcwiz for Hero

void create()
{
        set_name(HIW "「独孤九剑残本」" NOR, ({ "dugu canben", "dugu", "canben" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("material", "paper");
                set("no_sell", 1);
                set("long", HIW "\n这是一本用薄纸写成的书，封皮上写有「独孤九剑\n"
                                  "残本」六字。书皮泛黄，看来已经保存很久了。书\n"
                                  "中记载了剑魔独孤求败所创独孤九剑之精髓。\n"
                                  "你试图翻阅里面记载的内容，但是你只觉得深奥无\n"
                                  "比，如无独孤求败本人讲解，是永远无法参透的。\n");
        }
}

