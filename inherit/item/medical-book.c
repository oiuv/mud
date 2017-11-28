// medical-book.c

inherit ITEM;

#include <ansi.h>
#include <medical.h>

int is_book() { return 1; }

void setup()
{
        string msg;
        mapping med;
        string *ks;
        int i;

        if (clonep())
                return;

        msg = query("long");
        med = query("can_make");
        if (! mapp(med) || ! sizeof(med))
                return;

        ks = keys(med);
        msg += "上面记载了";
        for (i = 0; i < sizeof(ks); i++)
        {
                if (file_size(MEDICINE(ks[i]) + ".c") < 0)
                {
                        log_file("log", "No such medicine:" + MEDICINE(ks[i]) +
                                 "\n");
                        delete("can_make/" + ks[i]);
                        continue;
                }
                if (i) msg += "、";
                msg += MEDICINE(ks[i])->name();
        }
        msg += "的炼制方法，倒是可以仔细读读(read)，琢磨一下。\n";
        msg = sort_string(msg, 64);
        set("long", msg);
}

void init()
{
        add_action("do_read", "read");
}

int do_read(string arg)
{
        object me;
        mapping med;
        string skill;
        string m_name;
        string fm_name;
        string *ks;
        int lvl;
        int i;
        int jing_cost;

        if (! arg)
                return notify_fail("你要读什么？\n");

        if (sscanf(arg, "%s from %s", m_name, arg) != 2)
                return notify_fail("研究配制药物：read 药名 from " +
                                   query("id") + "\n");

        if (! id(arg))
                return notify_fail("没有这本书啊。\n");

        med = query("can_make");
        if (! mapp(med) || ! sizeof(med))
        {
                write(name() + "上面并没有记载任何值得"
                      "特别研究的内容。\n");
                return 1;
        }

        me = this_player();
        if (me->query("can_make/" + m_name))
        {
                write("你已经通晓了「" + m_name + "」的秘密，没什么好研究的了。\n");
                return 1;
        }

        ks = keys(med);
        for (i = 0; i < sizeof(ks); i++)
        {
                if (filter_color(MEDICINE(ks[i])->name()) == m_name)
                        break;
        }

        if (i >= sizeof(ks))
        {
                write(name() + "上面并没有记载有关" +
                      m_name + "的内容。\n");
                return 1;
        }

        fm_name = "「" + MEDICINE(ks[i])->name() + "」";
        skill = query("skill/name");
        lvl = (int)me->query_skill(skill, 1);
        if (! lvl)
        {
                write("你现在对" + to_chinese(skill) + "还是"
                      "一窍不通，怎么研究得明白？\n");
                return 1;
        }

        jing_cost = med[ks[i]] / 2 + 50;
        if (jing_cost > me->query("jing"))
        {
                me->set("jing", 0);
                write("你觉得你现在精神不济，难以研究有关" +
                      fm_name + "的知识。\n");
                return 1;
        }

        me->receive_damage("jing", jing_cost);

        if (lvl < (int)med[ks[i]])
        {
                write("你觉得" + fm_name + "实在是"
                      "太复杂了，以你目前的" + to_chinese(skill) +
                      "的学识恐怕还难以弄明白。\n");
                return 1;
        }

        if (random(lvl) < (int)med[ks[i]])
        {
                write(random(2) ? "你研究了一会儿有关" + fm_name +
                                  "的内容，有些收获，不过还没有彻底明白。\n"
                                : "你仔细阅读了一会儿有关" + m_name +
                                  "的内容，明白了不少其中奥妙。\n");
                return 1;
        }

        write("你细细的研读了有关" + fm_name +
              "的内容，终于恍然大悟，彻底明白了其中的奥妙。\n");
        write(HIC "你学会了炼制" + fm_name + HIC "的方法。\n");
        me->set("can_make/" + m_name, ks[i]);
        return 1;
}

string extra_long()
{
        string str;
        
        str =  "\n物品类型    ：    秘本\n";
        str += sprintf("记载内容    ：    %s\n", to_chinese(query("skill/name")));
        str += sprintf("经验要求    ：    %d\n", query("skill/exp_required"));
        str += sprintf("研习难度    ：    %d\n", query("skill/difficulty"));
        str += sprintf("研习要求    ：    %s%d级\n", to_chinese(query("skill/name")), query("skill/min_skill"));
        str += sprintf("研习限制    ：    %d级\n", query("skill/max_skill"));
        str += sprintf("精力消耗    ：    %d点/次\n", query("skill/jing_cost"));
        str += sprintf("研习方法    ：    输入指令 du %s 研读。\n", query("id"));
        if (this_object()->query_autoload())
                str += "下线丢失    ：    否\n";
        else
                str += "下线丢失    ：    是\n";
        return str;
}
