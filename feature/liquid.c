/*
 * @Author: 雪风@mud.ren
 * @Date: 2021-09-09 19:51:51
 * @LastEditTime: 2021-09-09 19:51:51
 * @LastEditors: 雪风
 * @Description: 饮水公共接口
 *  https://bbs.mud.ren
 */
// liquid.c

#include <dbase.h>
#include <name.h>

mixed func = 0;

int is_liquid() { return 1; }

void apply_effect(function f)
{
    if (!func)
        func = f;
    else if (functionp(func))
        func = ({func, f});
    else if (sizeof(func) < 12)
        func += ({f});
}

void clear_effect()
{
    func = 0;
}

mixed query_effect()
{
    return func;
}

int do_effect(object me)
{
    int i;

    if (functionp(func))
        evaluate(func);

    if (arrayp(func))
        for (i = 0; i < sizeof(func); i++)
            evaluate(func[i]);

    return 1;
}

string extra_long()
{
    int amount, max;
    string str;

    if (amount = query("liquid/remaining"))
    {
        max = query("max_liquid");
        if (amount == max)
            str = "里面装满了" + query("liquid/name") + "。\n";
        else if (amount >= max * 4 / 5)
            str = "里面的" + query("liquid/name") + "被喝过少许，不过依然很满。\n";
        else if (amount >= max * 2 / 3)
            str = "里面装了七、八分满的" + query("liquid/name") + "。\n";
        else if (amount >= max * 2 / 5)
            str = "里面装了五、六分满的" + query("liquid/name") + "。\n";
        else if (amount >= 1)
            str = "里面装了少许的" + query("liquid/name") + "。\n";
        return str;
    }
    else
        return 0;
}
