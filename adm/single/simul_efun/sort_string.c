// sort a chinese string (must be chinese), align the
// string with then len. the prefix is used when the desc
// will be lead by another string or space with length is prefix.
varargs string sort_string(string input, int width, int prefix)
{
    int i;
    int sl;  // 字符串长度
    int len; // 字符串宽度
    int esc;
    string result;

    result = "";
    esc = 0;
    if (!width) width = 78;
    len = prefix;
    sl = strlen(input);
    for (i = 0; i < sl; i++)
    {
        if (len >= width && input[i] != '\n')
        {
            int k = i;
            // ANSI颜色字符处理
            if (input[i] == 27)
                while (k < sl && input[k++] != 'm')
                    ;

            switch ((k < sl) ? input[k..k] : 0)
            {
            // 部分中英文符号不换行
            case "’":   //8217
            case "”":   //8221
            case "、":  //12289
            case "。":  //12290
            case "！":  //65281
            case "）":  //65289
            case "，":  //65292
            case "：":  //65306
            case "；":  //65307
            case "？":  //65311
            case " ":   //32
            case "!":   //33
            case "”":   //34
            case "'":   //34
            case ")":   //41
            case ",":   //44
            case ".":   //46
            case ":":   //58
            case ";":   //59
            case "?":   //63
                if (k != i)
                {
                    result += input[i..k];
                    i = k;
                    continue;
                }
                break;
            default:
                len = 0;
                result += "\n";
                break;
            }
        }

        if (input[i] == 27)
            esc = 1;

        if (!esc)
        {
            // 非英文字符
            if (input[i] > 160)
            {
                result += input[i..i];
                len += 2;
                continue;
            }
            // 换行
            if (input[i] == '\n')
            {
                result += "\n";
                len = 0;
                continue;
            }
            len++;
        }
        if (esc && input[i] == 'm')
            esc = 0;

        result += input[i..i];
    }

    if (len)
        result += "\n";

    return result;
}
