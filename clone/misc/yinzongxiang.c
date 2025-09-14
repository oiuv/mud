// 神魂引踪香 - 师门任务追踪道具
// 蕴含神魂之力，可感应目标位置

#include <ansi.h>
inherit ITEM;

void remove();

void create()
{
    set_name(HIM "神魂引踪香" NOR, ({"yinzong xiang", "shenhun xiang", "xiang"}));
    if (clonep())
        set_default_object(__FILE__);
    else {
        set("unit", "根");
        set("long", HIM "这是一根暗紫色的线香，香体中隐约可见丝丝银光流转，如同星辰碎屑。
香头系着一缕纯白色的丝线，散发着淡淡的、难以名状的清香，既非草木
之香，也非脂粉之气，而是一种直透心脾的奇异味道。

此香蕴含精纯的神魂之力，可用于感应天地间生灵的魂魄波动。");
        set("value", 10000);
        set("base_value", 10000); // 基础价值
        set("material", "incense"); // 材料类型
    }
    setup();
}

// 追踪目标
object find_room()
{
    object me = this_player(), npc, room;
    mapping quest = me->query("quest");

    // 检查是否有师门任务
    if (!mapp(quest) || !quest["id"]) {
        tell_object(me, HIC "你没有任务在身，折腾个啥。\n" NOR);
        return 0;
    }
    npc = find_living(quest["id"]);
    // 任务过期
    if (!npc)
    {
        tell_object(me, HIC "你的任务目标早就无影无踪了，还是想想其它办法吧。\n" NOR);
        return 0;
    }

    if (clonep())
    {
        message_vision(HIM "$N" HIM "手中掐诀，一缕真元注入$n" HIM "中！\n" NOR, me, this_object());
        tell_object(me, HIC "线香顶端突然亮起一点银光，香烟袅袅升起，在空中形成奇异的纹路...\n" NOR);
        tell_object(me, HIW "借助师门任务的因果之力和引踪香中的神魂之力，你与目标之间建立了一丝微妙的联系！\n" NOR);
        message("vision", HIC "神魂引踪香燃烧殆尽，化作一缕青烟，缓缓消散在天地间。\n" NOR, environment());
    }
    room = environment(npc);
    // 消耗道具
    destruct(this_object());

    return room;
}

// 道具销毁时的特殊效果
void remove(object ob)
{
}
